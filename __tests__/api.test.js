import ImageminPlugin from "..";
import test from "ava";

test("should provide api", t => {
  t.true(ImageminPlugin instanceof Object);
  t.true(typeof ImageminPlugin.loader === "string");
});
